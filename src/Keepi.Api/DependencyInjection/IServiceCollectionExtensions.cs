using Keepi.Api.Helpers;
using Microsoft.Extensions.DependencyInjection;

namespace Keepi.Api.DependencyInjection;

public static class IServiceCollectionExtensions
{
  public static IServiceCollection AddApiHelpers(this IServiceCollection services)
  {
    services.AddScoped<IResolveUserHelper, ResolveUserHelper>();

    return services;
  }
}