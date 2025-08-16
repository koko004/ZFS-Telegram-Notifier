
import { NextResponse } from 'next/server';
import { testSSHConnection, SSHCredentials } from '@/services/ssh-service';

export async function POST(request: Request) {
  try {
    const { remoteAddress, username, password } = await request.json();

    if (!remoteAddress || !username || !password) {
      return NextResponse.json({ message: 'Remote address, username, and password are required.' }, { status: 400 });
    }

    const [host] = remoteAddress.split(':'); // Basic host parsing
    const credentials: SSHCredentials = { host, username, password };

    const isSuccess = await testSSHConnection(credentials);

    if (isSuccess) {
      return NextResponse.json({ message: `Successfully connected to ${remoteAddress}.` });
    } else {
      return NextResponse.json({ message: 'Could not connect. Check address and credentials.' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
