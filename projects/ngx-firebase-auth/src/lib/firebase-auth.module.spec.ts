import { FirebaseAuthModule } from './firebase-auth.module';

describe('FirebaseAuthModule', () => {
  let firebaseAuthModule: FirebaseAuthModule;

  beforeEach(() => {
    firebaseAuthModule = new FirebaseAuthModule();
  });

  it('should create an instance', () => {
    expect(firebaseAuthModule).toBeTruthy();
  });
});
