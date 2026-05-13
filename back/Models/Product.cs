namespace SiaInteractiveApi.Models;

public class Product
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Detalle { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public decimal Precio { get; set; }
}
