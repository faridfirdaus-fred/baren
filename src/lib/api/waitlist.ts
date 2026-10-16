export const WAITLIST_PER_PAGE = 25;

export type WaitlistItem = {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
};

export type WaitlistPage = {
  items: WaitlistItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type WaitlistLister = {
  list(
    search: string | undefined,
    page: number,
    perPage: number,
  ): Promise<{ items: WaitlistItem[]; total: number }>;
};

export async function readWaitlistPage(
  lister: WaitlistLister,
  input: { page: number; search?: string },
): Promise<WaitlistPage> {
  const { items, total } = await lister.list(
    input.search,
    input.page,
    WAITLIST_PER_PAGE,
  );
  return {
    items,
    page: input.page,
    perPage: WAITLIST_PER_PAGE,
    total,
    totalPages: Math.ceil(total / WAITLIST_PER_PAGE),
  };
}
