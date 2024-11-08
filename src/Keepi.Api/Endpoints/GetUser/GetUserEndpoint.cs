using FastEndpoints;

namespace Keepi.Api.Endpoints.GetUser;

public class GetUserEndpoint : EndpointWithoutRequest<GetUserResponse>
{
  public override void Configure()
  {
    Get("/user");
  }

  public override async Task HandleAsync(CancellationToken cancellationToken)
  {
    if (User.Identity?.Name != null)
    {
      await SendAsync(
        response: new GetUserResponse
        {
          Name = User.Identity.Name,
          Claims = User.Claims.ToDictionary(
            keySelector: (claim) => claim.Type,
            elementSelector: (claim) => claim.Value)
        },
        cancellation: cancellationToken);
    }
    else
    {
      await SendUnauthorizedAsync(cancellationToken);
    }
  }
}