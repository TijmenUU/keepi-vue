namespace Keepi.Api.Endpoints.GetUser;

public class GetUserResponse
{
  public string Name { get; set; } = string.Empty;
  public Dictionary<string, string> Claims { get; set; } = new();
}