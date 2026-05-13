using Microsoft.AspNetCore.Mvc;
using SiaInteractiveApi.Models;
using SiaInteractiveApi.Services;

namespace SiaInteractiveApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(ProductService productService) : ControllerBase
{
    [HttpPost]
    public ActionResult<OrderResponse> CreateOrder([FromBody] OrderRequest request)
    {
        if (request.Items.Count == 0)
            return BadRequest(new { message = "El pedido no puede estar vacío." });

        var total = request.Items.Sum(item =>
        {
            var product = productService.GetById(item.ProductId);
            return product is null ? 0 : product.Precio * item.Quantity;
        });

        var response = new OrderResponse
        {
            OrderId = $"ORD-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            Status = "confirmed",
            Total = total,
            CreatedAt = DateTime.UtcNow,
            Message = "Pedido recibido correctamente. En breve será procesado."
        };

        return Ok(response);
    }
}
