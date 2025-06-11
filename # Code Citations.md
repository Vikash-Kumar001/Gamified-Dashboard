# Code Citations

## License: MIT
https://github.com/charon1212/authentication_app_devchallenges/tree/a43385f318afc6adc4883a89063cd43dc92b319b/README.md

```
= '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
`
```

