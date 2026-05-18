using CafeteriaApp.Data;
using Microsoft.EntityFrameworkCore;
using CafeteriaApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CafeteriaApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _db;

        public AuthController(IConfiguration config, AppDbContext db)
        {
            _config = config;
            _db = db;
        }

        // POST /api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            {
                return BadRequest("Username already exists");
            }

            var user = new User
            {
                Username = dto.Username,
                Password = dto.Password, 
                Email = dto.Email,
                Mobile = dto.Mobile,
                Role = "User"
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var token = GenerateToken(user.Username, user.Role);
            return Ok(new { token });
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => 
                u.Username == dto.Username && u.Password == dto.Password);

            if (user != null)
            {
                var token = GenerateToken(user.Username, user.Role);
                return Ok(new { token });
            }

            return Unauthorized("Invalid username or password");
        }

        private string GenerateToken(string username, string role)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, username),
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public record UserDto(string Username, string Password);
    public record RegisterDto(string Username, string Password, string Email, string Mobile);
}