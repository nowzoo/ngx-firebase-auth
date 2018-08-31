import { NgxFirebaseAuthModule } from './ngx-firebase-auth.module';

describe('FirebaseAuthModule', () => {
  let firebaseAuthModule: NgxFirebaseAuthModule;

  beforeEach(() => {
    firebaseAuthModule = new NgxFirebaseAuthModule();
  });

  it('should create an instance', () => {
    expect(firebaseAuthModule).toBeTruthy();
  });
});
