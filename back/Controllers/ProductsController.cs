using Microsoft.AspNetCore.Mvc;
using SiaInteractiveApi.Models;
using SiaInteractiveApi.Services;

namespace SiaInteractiveApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(ProductService productService) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Product>> Get(
        [FromQuery] string? query,
        [FromQuery] string? tipo,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice)
    {
        return Ok(productService.Search(query, tipo, minPrice, maxPrice));
    }

    [HttpGet("{id}")]
    public ActionResult<Product> GetById(int id)
    {
        var product = productService.GetById(id);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpGet("tipos")]
    public ActionResult<IEnumerable<string>> GetTipos()
    {
        return Ok(productService.GetTipos());
    }
}
