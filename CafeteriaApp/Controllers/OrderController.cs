using CafeteriaApp.Data;
using CafeteriaApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CafeteriaApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _db;
        public OrderController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var orders = await _db.Orders
                .Include(o => o.Items)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new {
                    o.Id,
                    o.Status,
                    o.CreatedAt,
                    o.UserName,
                    TotalPrice = o.Items.Sum(i => i.Price * i.Quantity),
                    Items = o.Items.Select(i => new {
                        i.ItemName,
                        i.Price,
                        i.Quantity
                    })
                })
                .ToListAsync();
            return Ok(orders);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _db.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new {
                    o.Id,
                    o.Status,
                    o.CreatedAt,
                    o.UserName,
                    TotalPrice = o.Items.Sum(i => i.Price * i.Quantity),
                    Items = o.Items.Select(i => new {
                        i.ItemName,
                        i.Price,
                        i.Quantity
                    })
                })
                .ToListAsync();
            return Ok(orders);
        }

        [HttpPost]
        public async Task<IActionResult> PlaceOrder(List<CartItemDto> items)
        {
            if (items == null || items.Count == 0)
            {
                return BadRequest("You must select items first");
            }
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            var userName = User.FindFirst(ClaimTypes.Name)?.Value!;

            var itemIds = items.Select(i => i.MenuItemId).ToList();
            var menuItems = await _db.MenuItems.Where(mi => itemIds.Contains(mi.Id)).ToListAsync();

            if (menuItems.Count != items.Select(i => i.MenuItemId).Distinct().Count())
            {
                return BadRequest("One or more items are not found");
            }

            var order = new Order
            {
                UserId = userId,
                UserName = userName,
                Items = menuItems.Select(mi => new OrderItem
                {
                    MenuItemId = mi.Id,
                    ItemName = mi.Name,
                    Price = mi.Price,
                    Quantity = items.First(i => i.MenuItemId == mi.Id).Quantity
                }).ToList()
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            return Ok(order);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var order = await _db.Orders.FindAsync(id);
            if (order == null) return NotFound();

            if (Enum.TryParse<OrderStatus>(status, true, out var newStatus))
            {
                order.Status = newStatus;
                await _db.SaveChangesAsync();
                return NoContent();
            }
            return BadRequest("Invalid status");
        }

        // GET /api/orders/admin
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AllOrders()
        {
            var orders = await _db.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
            return Ok(orders);
        }

        // PUT /api/orders/{id}/status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] OrderStatus status)
        {
            var order = await _db.Orders.FindAsync(id);
            if (order is null) return NotFound();
            order.Status = status;
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    public record OrderItemDto(int MenuItemId, int Quantity);
}