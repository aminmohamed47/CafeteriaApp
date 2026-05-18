using CafeteriaApp.Data;
using CafeteriaApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CafeteriaApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CategoryController(AppDbContext db) => _db = db;

        // GET /api/category
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _db.Categories
                .Include(c => c.MenuItems)
                .ToListAsync();
            return Ok(categories);
        }

        // GET /api/category/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _db.Categories
                .Include(c => c.MenuItems)
                .FirstOrDefaultAsync(c => c.Id == id);
            return category is null ? NotFound() : Ok(category);
        }

        // POST /api/category
        [HttpPost]
        public async Task<IActionResult> Create(Category category)
        {
            _db.Categories.Add(category);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        // PUT /api/category/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Category updated)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category is null) return NotFound();
            category.Name = updated.Name;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/category/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _db.Categories.FindAsync(id);
            if (category is null) return NotFound();
            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}