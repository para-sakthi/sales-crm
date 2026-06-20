export class PaginatedMetaDto {
  nextCursor: string | null;
  total: number;

  constructor(nextCursor: string | null, total: number) {
    this.nextCursor = nextCursor;
    this.total = total;
  }
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: PaginatedMetaDto;

  constructor(data: T[], meta: PaginatedMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
