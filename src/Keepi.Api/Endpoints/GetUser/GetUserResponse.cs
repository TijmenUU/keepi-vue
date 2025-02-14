namespace Keepi.Api.Endpoints.GetUser;

public class GetUserResponse(string name, bool registered)
{
  public string Name { get; } = name;
  public bool Registered { get; } = registered;
}