using FastEndpoints;
using Keepi.Api.Extensions;
using Keepi.Core.Enums;
using Keepi.Core.Repositories;

namespace Keepi.Api.Endpoints.GetUserEntryCategories;

public class GetUserEntryCategoriesEndpoint(
  IGetUser getUser,
  IGetUserEntryCategories getUserEntryCategories)
 : EndpointWithoutRequest<GetUserEntryCategoriesResponse>
{
  public override void Configure()
  {
    Get("/user/entrycategories");
  }

  public override async Task HandleAsync(CancellationToken cancellationToken)
  {
    if (!User.TryGetUserInfo(out var userInfo))
    {
      await SendForbiddenAsync(cancellation: cancellationToken);
      return;
    }

    var user = await getUser.Execute(
      externalId: userInfo.ExternalId,
      identityProvider: UserIdentityProvider.GitHub,
      cancellationToken: cancellationToken);

    var entryCategories = await getUserEntryCategories.Execute(
      userId: user.Id,
      cancellationToken: cancellationToken);

    await SendAsync(
      response: new GetUserEntryCategoriesResponse(entryCategories: entryCategories
        .Select(c => new GetUserEntryCategoriesResponseCategory(
          id: c.Id,
          name: c.Name,
          enabled: c.Enabled,
          activeFrom: c.ActiveFrom,
          activeTo: c.ActiveTo
        ))
        .ToArray()),
      cancellation: cancellationToken);
  }
}