import { database } from '../firebaseConfig';
import { ref, get, set, remove } from 'firebase/database';

export class BaseService {
  protected baseNode: string;

  constructor(baseNode: string = '') {
    this.baseNode = baseNode;
  }

  protected getRef(path: string) {
    return ref(database, `${this.baseNode}/${path}`);
  }

  protected async exists(path: string): Promise<boolean> {
    const snapshot = await get(this.getRef(path));
    return snapshot.exists();
  }

  protected async getData<T>(path: string): Promise<T | null> {
    const snapshot = await get(this.getRef(path));
    return snapshot.val();
  }

  protected async setData(path: string, data: any): Promise<void> {
    await set(this.getRef(path), data);
  }

  protected async removeData(path: string): Promise<void> {
    await remove(this.getRef(path));
  }
}
