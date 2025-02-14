using Keepi.Core.Repositories;
using Keepi.Data.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Keepi.Data.DependencyInjection;

public static class IServiceCollectionExtensions
{
  public static IServiceCollection AddRepositories(this IServiceCollection services)
  {
    services.AddDbContext<DatabaseContext>();

    services.AddScoped<UserRepository>();
    services.AddScoped<IGetUserWithCategories>(sp => sp.GetRequiredService<UserRepository>());
    services.AddScoped<IGetUserExists>(sp => sp.GetRequiredService<UserRepository>());
    services.AddScoped<IStoreNewUser>(sp => sp.GetRequiredService<UserRepository>());

    return services;
  }
}