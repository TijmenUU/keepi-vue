#nullable disable
using System.ComponentModel.DataAnnotations;
using Keepi.Infrastructure.Data.Enums;
using Microsoft.EntityFrameworkCore;

namespace Keepi.Infrastructure.Data.Entities;

[Index(nameof(ExternalId), IsUnique = true)]
[Index(nameof(EmailAddress), IsUnique = true)]
internal sealed class UserEntity
{
  public int Id { get; set; }
  [Required, MaxLength(64)]
  public string ExternalId { get; set; }
  [Required, MaxLength(128)]
  public string EmailAddress { get; set; }
  [Required, MaxLength(128)]
  public string Name { get; set; }
  public UserIdentityOrigin IdentityOrigin { get; set; }

  public List<EntryCategoryEntity> EntryCategories { get; set; }
  public List<UserEntryEntity> Entries { get; set; }
}