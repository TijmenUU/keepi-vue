using FastEndpoints;
using Keepi.Core.Repositories;

namespace Keepi.Api.Endpoints.GetUser;

public class GetUserEndpoint(IGetUserExists getUserExists)
 : EndpointWithoutRequest<GetUserResponse>
{
  public override void Configure()
  {
    Get("/user");
  }

  public override async Task HandleAsync(CancellationToken cancellationToken)
  {
    if (!User.TryGetUserInfo(out var userInfo))
    {
      await SendForbiddenAsync(cancellation: cancellationToken);
      return;
    }

    await SendAsync(
      response: new GetUserResponse(
        name: userInfo.Name,
        registered: await getUserExists.Execute(
        externalId: userInfo.ExternalId,
        emailAddress: userInfo.EmailAddress,
        cancellationToken: cancellationToken)),
      cancellation: cancellationToken);
  }
}