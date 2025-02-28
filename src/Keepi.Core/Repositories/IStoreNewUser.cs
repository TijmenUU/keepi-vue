using Keepi.Core.Enums;

namespace Keepi.Core.Repositories;

public interface IStoreNewUser
{
  Task Execute(
    string externalId,
    string emailAddress,
    string name,
    UserIdentityProvider userIdentityProvider,
    CancellationToken cancellationToken);
}