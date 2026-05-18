using CafeteriaApp.Data;
using CafeteriaApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CafeteriaApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController : ControllerBase
    {
        private readonly AppDbContext _db;

        public MenuController(AppDbContext db) => _db = db;

        // GET /api/menu
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _db.MenuItems
                .Include(m => m.Category)
                .Where(m => m.IsAvailable)
                .ToListAsync();
            return Ok(items);
        }

        // GET /api/menu/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _db.MenuItems
                .Include(m => m.Category)
                .FirstOrDefaultAsync(m => m.Id == id);
            return item is null ? NotFound() : Ok(item);
        }

        // POST /api/menu
        [HttpPost]
        public async Task<IActionResult> Create(MenuItem item)
        {
            _db.MenuItems.Add(item);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        // PUT /api/menu/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MenuItem updated)
        {
            var item = await _db.MenuItems.FindAsync(id);
            if (item is null) return NotFound();

            item.Name = updated.Name;
            item.Description = updated.Description;
            item.Price = updated.Price;
            item.IsAvailable = updated.IsAvailable;
            item.CategoryId = updated.CategoryId;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/menu/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _db.MenuItems.FindAsync(id);
            if (item is null) return NotFound();
            _db.MenuItems.Remove(item);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}