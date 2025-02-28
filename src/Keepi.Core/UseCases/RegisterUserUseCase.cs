using Keepi.Core.Enums;
using Keepi.Core.Repositories;

namespace Keepi.Core.UseCases;

public enum RegisterUserUseCaseResult
{
  UserAlreadyExists,
  UserCreated,
};

public interface IRegisterUserUseCase
{
  Task<RegisterUserUseCaseResult> Execute(
    string externalId,
    string emailAddress,
    string name,
    UserIdentityProvider provider,
    CancellationToken cancellationToken);
}

internal class RegisterUserUseCase(
  IGetUserExists getUserExists,
  IStoreNewUser storeNewUser)
  : IRegisterUserUseCase
{
  public async Task<RegisterUserUseCaseResult> Execute(
    string externalId,
    string emailAddress,
    string name,
    UserIdentityProvider provider,
    CancellationToken cancellationToken)
  {
    if (await getUserExists.Execute(
      externalId: externalId,
      emailAddress: emailAddress,
      cancellationToken: cancellationToken))
    {
      return RegisterUserUseCaseResult.UserAlreadyExists;
    }

    await storeNewUser.Execute(
      externalId: externalId,
      emailAddress: emailAddress,
      name: name,
      userIdentityProvider: provider,
      cancellationToken: cancellationToken);

    return RegisterUserUseCaseResult.UserCreated;
  }
}