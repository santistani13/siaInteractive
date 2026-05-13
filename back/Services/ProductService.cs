using System.Text.Json;
using SiaInteractiveApi.Models;

namespace SiaInteractiveApi.Services;

public class ProductService
{
    private readonly List<Product> _products;

    public ProductService(IWebHostEnvironment env)
    {
        var jsonPath = Path.Combine(env.ContentRootPath, "Data", "products.json");
        var json = File.ReadAllText(jsonPath);
        _products = JsonSerializer.Deserialize<List<Product>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? [];
    }

    public IEnumerable<Product> GetAll() => _products;

    public IEnumerable<Product> Search(string? query, string? tipo, decimal? minPrice, decimal? maxPrice)
    {
        var result = _products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
            result = result.Where(p =>
                p.Nombre.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                p.Detalle.Contains(query, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(tipo))
            result = result.Where(p => p.Tipo.Equals(tipo, StringComparison.OrdinalIgnoreCase));

        if (minPrice.HasValue)
            result = result.Where(p => p.Precio >= minPrice.Value);

        if (maxPrice.HasValue)
            result = result.Where(p => p.Precio <= maxPrice.Value);

        return result.ToList();
    }

    public Product? GetById(int id) => _products.FirstOrDefault(p => p.Id == id);

    public IEnumerable<string> GetTipos() => _products.Select(p => p.Tipo).Distinct().OrderBy(t => t);
}
