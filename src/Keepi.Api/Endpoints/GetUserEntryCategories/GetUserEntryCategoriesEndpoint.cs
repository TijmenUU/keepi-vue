using FastEndpoints;
using Keepi.Api.Helpers;
using Keepi.Core.Repositories;
using Microsoft.Extensions.Logging;

namespace Keepi.Api.Endpoints.GetUserEntryCategories;

public class GetUserEntryCategoriesEndpoint(
  IResolveUserHelper resolveUserHelper,
  IGetUserEntryCategories getUserEntryCategories,
  ILogger<GetUserEntryCategoriesEndpoint> logger)
 : EndpointWithoutRequest<GetUserEntryCategoriesResponse>
{
  public override void Configure()
  {
    Get("/user/entrycategories");
  }

  public override async Task HandleAsync(CancellationToken cancellationToken)
  {
    var user = await resolveUserHelper.GetUserOrNull(
      userClaimsPrincipal: User,
      cancellationToken: cancellationToken);
    if (user == null)
    {
      logger.LogDebug("Refusing to return entry categories for unregistered user");
      await SendForbiddenAsync(cancellation: cancellationToken);
      return;
    }

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