#nullable disable
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Keepi.Data.Entities;

[Index(nameof(Name), nameof(UserId), IsUnique = true)]
[Index(nameof(ActiveFrom), nameof(ActiveTo))]
internal sealed class EntryCategoryEntity
{
  public int Id { get; set; }
  [Required]
  public string Name { get; set; }
  public bool Enabled { get; set; }
  public DateOnly? ActiveFrom { get; set; }
  public DateOnly? ActiveTo { get; set; }

  public int UserId { get; set; }
  [Required]
  public UserEntity User { get; set; }

  public List<UserEntryEntity> UserEntries { get; set; }
}