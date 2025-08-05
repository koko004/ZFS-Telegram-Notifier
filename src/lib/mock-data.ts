import type { Pool } from './types';

export const mockPools: Pool[] = [
  {
    id: 'pool-1',
    name: 'rpool-main-server',
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
            status: 'online',
            errors: { read: 0, write: 0, checksum: 0 },
            smartData: 'SMART Self-test log structure revision number 1\nNum  Test_Description    Status                  Remaining  LifeTime(hours)  LBA_of_first_error\n# 1  Short offline       Completed without error       00%      1105         -'
          },
          {
            id: 'disk-1-2',
            name: 'nvme1n1p3',
            status: 'online',
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
  {
    id: 'pool-2',
    name: 'tank-media-archive',
    status: 'degraded',
    size: 12000,
    allocated: 8500,
    free: 3500,
    vdevs: [
      {
        type: 'raidz1',
        disks: [
          {
            id: 'disk-2-1',
            name: 'sda',
            status: 'online',
            errors: { read: 0, write: 0, checksum: 0 },
            smartData: 'Device Model: WDC WD40EFRX-68N32N0\nSerial Number: WD-WCC7K4YFXXXX\n197 Current_Pending_Sector  0x0032   200   200   000    Old_age   Always       -       0\n198 Offline_Uncorrectable 0x0030   100   253   000    Old_age   Offline      -       0'
          },
          {
            id: 'disk-2-2',
            name: 'sdb',
            status: 'degraded',
            errors: { read: 12, write: 0, checksum: 4 },
            smartData: 'Device Model: WDC WD40EFRX-68N32N0\nSerial Number: WD-WCC7K4YFYYYY\n197 Current_Pending_Sector  0x0032   200   198   000    Old_age   Always       -       12\n198 Offline_Uncorrectable 0x0030   100   253   000    Old_age   Offline      -       4'
          },
          {
            id: 'disk-2-3',
            name: 'sdc',
            status: 'online',
            errors: { read: 0, write: 0, checksum: 0 },
            smartData: 'Device Model: WDC WD40EFRX-68N32N0\nSerial Number: WD-WCC7K4YFZZZZ\n197 Current_Pending_Sector  0x0032   200   200   000    Old_age   Always       -       0\n198 Offline_Uncorrectable 0x0030   100   253   000    Old_age   Offline      -       0'
          },
        ],
      },
    ],
    logs: [
      '2024-05-22T11:00:00Z: WARNING: Pool tank-media-archive is in degraded state.',
      '2024-05-22T11:00:05Z: Errors detected on disk sdb.',
      '2024-05-22T11:01:00Z: Checksum errors on vdev raidz1-0.',
    ],
    errorAnalysis: {
        isAnomaly: true,
        explanation: "The pool is in a degraded state due to read and checksum errors on disk 'sdb'. This requires immediate attention to prevent data loss."
    }
  },
  {
    id: 'pool-3',
    name: 'backup-storage',
    status: 'faulted',
    size: 2000,
    allocated: 1800,
    free: 200,
    vdevs: [
        {
            type: 'stripe',
            disks: [
                {
                    id: 'disk-3-1',
                    name: 'sdd',
                    status: 'online',
                    errors: { read: 0, write: 0, checksum: 0 },
                },
                {
                    id: 'disk-3-2',
                    name: 'sde',
                    status: 'faulted',
                    errors: { read: 512, write: 256, checksum: 128 },
                }
            ]
        }
    ],
    logs: [
        '2024-05-23T09:15:00Z: CRITICAL: Pool backup-storage is FAULTED.',
        '2024-05-23T09:15:10Z: Disk sde is offline.',
        '2024-05-23T09:15:12Z: Too many errors on sde. The device has been removed.',
    ]
  }
];
