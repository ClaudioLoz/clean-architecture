import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { FirebaseConfigService } from '../config/firebase.config';
import * as admin from 'firebase-admin';

interface FirebaseUserDocument {
  id: string;
  username: string;
  email: string;
  password?: string;
}

@Injectable()
export class FirebaseUserRepository implements UserRepository {
  private readonly firestore: admin.firestore.Firestore;
  private readonly collection = 'users';

  constructor() {
    this.firestore = FirebaseConfigService.getInstance().getFirestore();
  }

  async save(user: User): Promise<User> {
    const userDoc = this.firestore.collection(this.collection).doc(user.id);
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
    };

    await userDoc.set(userData);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await this.firestore
      .collection(this.collection)
      .doc(id)
      .get();

    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data();
    if (!data) {
      return null;
    }

    return this.mapFirebaseDocumentToUser(data as FirebaseUserDocument);
  }

  async findByEmail(email: string): Promise<User | null> {
    const querySnapshot = await this.firestore
      .collection(this.collection)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return this.mapFirebaseDocumentToUser(data as FirebaseUserDocument);
  }

  async update(user: User): Promise<User> {
    const userDoc = this.firestore.collection(this.collection).doc(user.id);
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
    };

    await userDoc.update(userData);
    return user;
  }

  private mapFirebaseDocumentToUser(data: FirebaseUserDocument): User {
    return new User(data.id, data.username, data.email, data.password);
  }
}
