using FastEndpoints;

namespace Keepi.Api.GetAuthorizedTest;

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
        },
        cancellation: cancellationToken);
    }
    else
    {
      await SendUnauthorizedAsync(cancellationToken);
    }
  }
}