// staff.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { StaffDTO } from '../model/dto/staff-dto';
import { StaffMapper } from '../model/mapper/staff-mapper';
import { ApiResponse } from '../model/response/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl = `${environment.apiUrl}api/staff`;

  constructor(private http: HttpClient) { }

  getAllStaff(page: number = 0, size: number = 10): Observable<ApiResponse<StaffDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<StaffDTO>>(this.apiUrl, { params });
  }

  getStaffById(id: number): Observable<StaffDTO> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(StaffMapper.toDTO)
    );
  }

  createStaff(staff: Partial<StaffDTO>): Observable<StaffDTO> {
    return this.http.post<any>(this.apiUrl, StaffMapper.toAPI(staff)).pipe(
      map(StaffMapper.toDTO)
    );
  }

  updateStaff(id: number, staff: Partial<StaffDTO>): Observable<StaffDTO> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, StaffMapper.toAPI(staff)).pipe(
      map(StaffMapper.toDTO)
    );
  }
}