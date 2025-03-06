using Keepi.Core.Enums;
using Keepi.Core.Repositories;
using Keepi.Core.UseCases;

namespace Keepi.Core.Unit.Tests.UseCases;

public class RegisterUserUseCaseTests
{
    [Fact]
    public async Task Execute_creates_user_for_unknown_user_identity()
    {
        var context = new TestContext()
            .WithExistingUserResultFor(
                externalId: "external ID",
                emailAddress: "test@example.com",
                result: false)
            .WithSuccesfulStoreNewUserResult(
                externalId: "external ID",
                emailAddress: "test@example.com",
                name: "Piet Hein",
                identityProvider: UserIdentityProvider.GitHub);

        var useCase = context.BuildUseCase();

        var result = await useCase.Execute(
            externalId: "external ID",
            emailAddress: "test@example.com",
            name: "Piet Hein",
            provider: UserIdentityProvider.GitHub,
            cancellationToken: CancellationToken.None);

        result.ShouldBe(RegisterUserUseCaseResult.UserCreated);

        context.StoreNewUserMock.Verify(x => x.Execute("external ID", "test@example.com", "Piet Hein", UserIdentityProvider.GitHub, It.IsAny<CancellationToken>()));
    }

    [Fact]
    public async Task Execute_does_not_create_user_for_already_known_user_identity()
    {
        var context = new TestContext()
            .WithExistingUserResultFor(
                externalId: "external ID",
                emailAddress: "test@example.com",
                result: true)
            .WithSuccesfulStoreNewUserResult(
                externalId: "external ID",
                emailAddress: "test@example.com",
                name: "Piet Hein",
                identityProvider: UserIdentityProvider.GitHub);

        var useCase = context.BuildUseCase();

        var result = await useCase.Execute(
            externalId: "external ID",
            emailAddress: "test@example.com",
            name: "Piet Hein",
            provider: UserIdentityProvider.GitHub,
            cancellationToken: CancellationToken.None);

        result.ShouldBe(RegisterUserUseCaseResult.UserAlreadyExists);

        context.StoreNewUserMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task Execute_returns_error_on_duplicate_user_error()
    {
        var context = new TestContext()
            .WithExistingUserResultFor(
                externalId: "external ID",
                emailAddress: "test@example.com",
                result: false)
            .WithErrorStoreNewUserResult(error: StoreNewUserError.DuplicateUser);

        var useCase = context.BuildUseCase();

        var result = await useCase.Execute(
            externalId: "external ID",
            emailAddress: "test@example.com",
            name: "Piet Hein",
            provider: UserIdentityProvider.GitHub,
            cancellationToken: CancellationToken.None);

        result.ShouldBe(RegisterUserUseCaseResult.UserAlreadyExists);

        context.StoreNewUserMock.Verify(x => x.Execute("external ID", "test@example.com", "Piet Hein", UserIdentityProvider.GitHub, It.IsAny<CancellationToken>()));
    }

    [Fact]
    public async Task Execute_returns_error_on_unknown_error()
    {
        var context = new TestContext()
            .WithExistingUserResultFor(
                externalId: "external ID",
                emailAddress: "test@example.com",
                result: false)
            .WithErrorStoreNewUserResult(error: StoreNewUserError.Unknown);

        var useCase = context.BuildUseCase();

        var result = await useCase.Execute(
            externalId: "external ID",
            emailAddress: "test@example.com",
            name: "Piet Hein",
            provider: UserIdentityProvider.GitHub,
            cancellationToken: CancellationToken.None);

        result.ShouldBe(RegisterUserUseCaseResult.Unknown);

        context.StoreNewUserMock.Verify(x => x.Execute("external ID", "test@example.com", "Piet Hein", UserIdentityProvider.GitHub, It.IsAny<CancellationToken>()));
    }

    class TestContext
    {
        public Mock<IGetUserExists> GetUserExistsMock { get; } = new(MockBehavior.Strict);
        public Mock<IStoreNewUser> StoreNewUserMock { get; } = new(MockBehavior.Strict);

        public TestContext WithExistingUserResultFor(string externalId, string emailAddress, bool result)
        {
            GetUserExistsMock
                .Setup(x => x.Execute(externalId, emailAddress, It.IsAny<CancellationToken>()))
                .ReturnsAsync(result);

            return this;
        }

        public TestContext WithSuccesfulStoreNewUserResult(
            string externalId,
            string emailAddress,
            string name,
            UserIdentityProvider identityProvider)
        {
            StoreNewUserMock
                .Setup(x => x.Execute(externalId, emailAddress, name, identityProvider, It.IsAny<CancellationToken>()))
                .ReturnsAsync(MaybeErrorResult<StoreNewUserError>.CreateSuccess());

            return this;
        }

        public TestContext WithErrorStoreNewUserResult(StoreNewUserError error)
        {
            StoreNewUserMock
                .Setup(x => x.Execute(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<UserIdentityProvider>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MaybeErrorResult<StoreNewUserError>.CreateFailure(error));

            return this;
        }

        public RegisterUserUseCase BuildUseCase() => new(
            getUserExists: GetUserExistsMock.Object,
            storeNewUser: StoreNewUserMock.Object);
    }
}
