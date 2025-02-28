using FastEndpoints;
using Keepi.Api.Extensions;
using Keepi.Core.Enums;
using Keepi.Core.UseCases;
using Microsoft.Extensions.Logging;

namespace Keepi.Api.Endpoints.PostRegisterUser;

public class PostRegisterUserEndpoint(
  IRegisterUserUseCase registerUserUseCase,
  ILogger<PostRegisterUserEndpoint> logger)
  : Endpoint<PostRegisterUserRequest, PostRegisterUserResponse>
{
  public override void Configure()
  {
    Post("/registeruser");
  }

  public override async Task HandleAsync(
    PostRegisterUserRequest request,
    CancellationToken cancellationToken)
  {
    if (!User.TryGetUserInfo(out var userInfo))
    {
      logger.LogDebug("Refusing to register user without required claims present");

      await SendErrorsAsync(
        statusCode: 400,
        cancellation: cancellationToken);
      return;
    }

    var result = await registerUserUseCase.Execute(
      externalId: userInfo.ExternalId,
      emailAddress: userInfo.EmailAddress,
      name: userInfo.Name,
      provider: UserIdentityProvider.GitHub,
      cancellationToken: cancellationToken);

    switch (result)
    {
      case RegisterUserUseCaseResult.UserAlreadyExists:
        logger.LogDebug("Attempted to register a user that is already known");
        await SendAsync(
          response: new PostRegisterUserResponse(PostRegisterUserResponseResult.UserAlreadyExists),
          cancellation: cancellationToken);
        return;

      case RegisterUserUseCaseResult.UserCreated:
        await SendAsync(
          response: new PostRegisterUserResponse(PostRegisterUserResponseResult.Created),
          cancellation: cancellationToken);
        return;

      default:
        throw new NotImplementedException($"No handling implemented for user registration result {result}");
    }
  }
}