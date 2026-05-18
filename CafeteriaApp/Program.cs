using CafeteriaApp.Data;
using CafeteriaApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using Serilog;

// Configure Serilog Logger
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File(
        path: "Logs/cafeteria-log-.txt",
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Hook Serilog into ASP.NET Core
builder.Host.UseSerilog();

// Database
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(opt =>
    opt.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200", "http://localhost:53436")
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Seed Data
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();

        if (!db.Users.Any())
        {
            db.Users.Add(new User { Username = "admin", Password = "admin123", Role = "Admin" });
            db.SaveChanges();
        }

        if (!db.Categories.Any())
        {
            var cats = new List<Category>
            {
                new Category { Name = "Food" },
                new Category { Name = "Desserts" },
                new Category { Name = "Juices" },
                new Category { Name = "Hot Drinks" },
                new Category { Name = "Soda" }
            };
            db.Categories.AddRange(cats);
            db.SaveChanges();

            if (!db.MenuItems.Any())
            {
                db.MenuItems.AddRange(new List<MenuItem>
                {
                    new MenuItem { Name = "Beef Burger", Description = "Juicy beef patty with cheese", Price = 120, CategoryId = cats[0].Id, IsAvailable = true, ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500" },
                    new MenuItem { Name = "Chicken Pasta", Description = "Creamy pasta with grilled chicken", Price = 150, CategoryId = cats[0].Id, IsAvailable = true, ImageUrl = "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500" },
                    new MenuItem { Name = "Chocolate Cake", Description = "Rich chocolate lava cake", Price = 80, CategoryId = cats[1].Id, IsAvailable = true, ImageUrl = "https://images.unsplash.com/photo-1578985543813-bc5981d5ee3c?w=500" },
                    new MenuItem { Name = "Fresh Orange Juice", Description = "Natural orange juice", Price = 45, CategoryId = cats[2].Id, IsAvailable = true, ImageUrl = "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500" },
                    new MenuItem { Name = "Turkish Coffee", Description = "Traditional roasted coffee", Price = 35, CategoryId = cats[3].Id, IsAvailable = true, ImageUrl = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500" },
                    new MenuItem { Name = "Coca Cola", Description = "Refreshing soft drink", Price = 25, CategoryId = cats[4].Id, IsAvailable = true, ImageUrl = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500" }
                });
                db.SaveChanges();
            }
        }
    }
}
catch (Exception ex)
{
    Log.Error(ex, "Database seeding failed during application startup");
}

try
{
    Log.Information("Starting Cafeteria Web API host...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Cafeteria Web API host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}