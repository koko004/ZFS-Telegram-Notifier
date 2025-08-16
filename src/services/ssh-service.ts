import { NodeSSH } from 'node-ssh';

export interface SSHCredentials {
  host: string;
  username: string;
  password?: string;
  privateKey?: string;
}

export async function testSSHConnection(credentials: SSHCredentials): Promise<boolean> {
  const ssh = new NodeSSH();
  try {
    await ssh.connect(credentials);
    ssh.dispose();
    return true;
  } catch (error) {
    console.error('SSH connection failed:', error);
    return false;
  }
}

export async function executeSSHCommand(credentials: SSHCredentials, command: string, sshClient?: NodeSSH): Promise<string> {
  const ssh = sshClient || new NodeSSH();
  let shouldDispose = false;

  try {
    console.log(`Executing SSH command: ${command}`);
    if (!sshClient) {
      await ssh.connect(credentials);
      shouldDispose = true;
    }
    const result = await ssh.execCommand(command);
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    return result.stdout;
  } catch (error) {
    console.error(`Failed to execute SSH command: ${command}`, error);
    throw new Error(`Failed to execute SSH command: ${command}`);
  } finally {
    if (shouldDispose) {
      ssh.dispose();
    }
  }
}