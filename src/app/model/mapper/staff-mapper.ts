import { StaffDTO, StaffType } from '../dto/staff-dto';

export class StaffMapper {
  static toDTO(apiData: any): StaffDTO {
    return {
      id: apiData.id,
      user: {
        id: apiData.user?.id ?? apiData.userId, // Handle both nested and flat structures
        username: apiData.user?.username || '',
        email: apiData.user?.email || '',
        roles: apiData.user?.roles || []
      },
      firstName: apiData.firstName,
      lastName: apiData.lastName,
      fullName: `${apiData.firstName} ${apiData.lastName}`,
      phone: apiData.phone,
      staffType: apiData.staffType as StaffType,
      hireDate: apiData.hireDate,
      terminationDate: apiData.terminationDate || null,
      isActive: apiData.isActive ?? true, // Default to active
      isAvailable: apiData.isAvailable ?? false, // Default to unavailable
      pinCode: apiData.pinCode,
      hourlyRate: apiData.hourlyRate,
      formattedHourlyRate: apiData.hourlyRate ? `$${apiData.hourlyRate.toFixed(2)}` : '$0.00',
      statusBadge: apiData.isActive ? 'active' : 'inactive',
      deleted: apiData.deleted || false
    };
  }

  static toAPI(dto: Partial<StaffDTO>): any {
    if (!dto.user?.id) {
      throw new Error('User ID is required');
    }

    return {
      // Core required fields
      userId: dto.user.id, // Changed from nested to flat structure
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      staffType: dto.staffType,
      
      // Business logic fields
      hireDate: dto.hireDate,
      terminationDate: dto.terminationDate || null,
      isActive: dto.isActive ?? true,
      isAvailable: dto.isAvailable ?? false,
      
      // Security/authentication fields
      pinCode: dto.pinCode,
      
      // Financial fields
      hourlyRate: dto.hourlyRate,
      
      // Explicitly omitted UI fields:
      // - fullName
      // - formattedHourlyRate
      // - statusBadge
    };
  }
}