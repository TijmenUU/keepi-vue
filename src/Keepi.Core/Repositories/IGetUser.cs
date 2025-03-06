using Keepi.Core.Entities;
using Keepi.Core.Enums;

namespace Keepi.Core.Repositories;

public enum GetUserError
{
  Unknown,
  DoesNotExist,
}

public interface IGetUser
{
  Task<IValueOrErrorResult<UserEntity, GetUserError>> Execute(string externalId, UserIdentityProvider identityProvider, CancellationToken cancellationToken);
}