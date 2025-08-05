import type { PoolInput } from './types';

// This data is now only used as a template when adding a new pool.
// The actual data is fetched from Firebase.

export const mockPools: PoolInput[] = [
  {
    name: 'rpool-main-server',
    remoteAddress: 'user@192.168.1.100',
    status: 'online',
    size: 960,
    allocated: 450,
    free: 510,
    vdevs: [
      {
        type: 'mirror',
        disks: [
          {
            id: 'disk-1-1',
            name: 'nvme0n1p3',
            model: 'Samsung 970 EVO Plus 500GB',
            status: 'online',
            size: 500,
            temperature: 42,
            errors: { read: 0, write: 0, checksum: 0 },
            smartData: 'SMART Self-test log structure revision number 1\nNum  Test_Description    Status                  Remaining  LifeTime(hours)  LBA_of_first_error\n# 1  Short offline       Completed without error       00%      1105         -'
          },
          {
            id: 'disk-1-2',
            name: 'nvme1n1p3',
            model: 'Samsung 970 EVO Plus 500GB',
            status: 'online',
            size: 500,
            temperature: 45,
            errors: { read: 0, write: 0, checksum: 0 },
            smartData: 'SMART Self-test log structure revision number 1\nNum  Test_Description    Status                  Remaining  LifeTime(hours)  LBA_of_first_error\n# 1  Short offline       Completed without error       00%      1108         -'
          },
        ],
      },
    ],
    logs: [
      '2024-05-20T10:00:00Z: Scrub started on pool rpool-main-server.',
      '2024-05-20T14:30:00Z: Scrub finished on pool rpool-main-server with 0 errors.',
      '2024-05-21T08:00:00Z: Pool status is ONLINE.',
    ],
  },
];
