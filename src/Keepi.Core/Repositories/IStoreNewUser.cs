using Keepi.Core.UseCases;

namespace Keepi.Core.Repositories;

public interface IStoreNewUser
{
  Task Store(
    string externalId,
    string emailAddress,
    string name,
    RegisterUserIdentityProvider userIdentityProvider,
    CancellationToken cancellationToken);
}