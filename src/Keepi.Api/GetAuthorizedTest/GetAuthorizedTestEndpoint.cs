using FastEndpoints;

namespace Keepi.Api.GetAuthorizedTest;

public class GetAuthorizedTestEndpoint : EndpointWithoutRequest<GetAuthorizedTestResponse>
{
  public override void Configure()
  {
    Get("/testauthorized");
  }

  public override async Task HandleAsync(CancellationToken cancellationToken)
  {
    await SendAsync(
      response: new()
      {
        Message = $"You are {User.Identity?.Name ?? "anonymous?"}"
      },
      cancellation: cancellationToken);
  }
}