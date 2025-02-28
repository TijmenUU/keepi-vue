using Keepi.Core.Repositories;
using Keepi.Infrastructure.Data.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Keepi.Infrastructure.Data.DependencyInjection;

public static class IServiceCollectionExtensions
{
  public static IServiceCollection AddRepositories(this IServiceCollection services)
  {
    services.AddDbContext<DatabaseContext>();

    services.AddScoped<UserRepository>();
    services.AddScoped<IGetUserEntryCategories>(sp => sp.GetRequiredService<UserRepository>());
    services.AddScoped<IGetUserExists>(sp => sp.GetRequiredService<UserRepository>());
    services.AddScoped<IStoreNewUser>(sp => sp.GetRequiredService<UserRepository>());

    return services;
  }
}