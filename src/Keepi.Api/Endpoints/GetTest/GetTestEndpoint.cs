using FastEndpoints;

namespace Keepi.Api.Endpoints.GetTest;

public class GetTestEndpoint : EndpointWithoutRequest<GetTestResponse>
{
  public override void Configure()
  {
    Get("/test");
    AllowAnonymous();
  }

  public override async Task HandleAsync(CancellationToken cancellationToken)
  {
    await SendAsync(
      response: new()
      {
        Message = DateTime.UtcNow.ToString()
      },
      cancellation: cancellationToken);
  }
}