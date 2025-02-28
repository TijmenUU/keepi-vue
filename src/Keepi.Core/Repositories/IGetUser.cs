using Keepi.Core.Entities;
using Keepi.Core.Enums;

namespace Keepi.Core.Repositories;

public interface IGetUser
{
  Task<UserEntity> Execute(string externalId, UserIdentityProvider identityProvider, CancellationToken cancellationToken);
}