// staff.mapper.ts
import { StaffDTO, StaffType } from '../dto/staff-dto';

export class StaffMapper {
  static toDTO(apiData: any): StaffDTO {
    return {
      id: apiData.id,
      user: {
        id: apiData.user?.id,
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
      isActive: apiData.isActive,
      hourlyRate: apiData.hourlyRate,
      formattedHourlyRate: `$${apiData.hourlyRate?.toFixed(2)}`,
      statusBadge: apiData.isActive ? 'active' : 'inactive',
      deleted: apiData.deleted || false
    };
  }

  static toAPI(dto: Partial<StaffDTO>): any {
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      staffType: dto.staffType,
      hireDate: dto.hireDate,
      terminationDate: dto.terminationDate || null,
      isActive: dto.isActive,
      pinCode: dto.pinCode,
      hourlyRate: dto.hourlyRate,
      user: { id: dto.user?.id }
    };
  }
}