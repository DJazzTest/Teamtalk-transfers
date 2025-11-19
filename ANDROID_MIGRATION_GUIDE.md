# Android Native App Migration Guide

## Overview
This document outlines the process of converting the TeamTalk Transfers React/TypeScript web application into a native Android app using Kotlin/Java with Android Views or Jetpack Compose.

## Migration Options

### Option 1: Full Native Rewrite (Recommended for Best Performance)
**Technology Stack:**
- **Language:** Kotlin (recommended) or Java
- **UI Framework:** Jetpack Compose (modern) or Android Views (traditional)
- **Architecture:** MVVM with Android Architecture Components
- **Networking:** Retrofit + OkHttp
- **Database:** Room Database (for local caching)
- **Dependency Injection:** Hilt or Koin

**Pros:**
- Best performance and native feel
- Full access to Android APIs
- Better battery optimization
- Native UI/UX patterns
- Smaller app size potential

**Cons:**
- Complete rewrite required
- Longer development time
- Need Android development expertise
- Separate codebase to maintain

### Option 2: React Native (Hybrid Approach)
**Technology Stack:**
- React Native
- TypeScript (can reuse some logic)
- React Native libraries

**Pros:**
- Can reuse ~60-70% of business logic
- Faster development
- Cross-platform (iOS + Android)
- Familiar React patterns

**Cons:**
- Performance not as good as native
- Some native features require bridging
- Larger app size

### Option 3: Progressive Web App (PWA) → TWA
**Technology Stack:**
- Convert existing web app to PWA
- Wrap in Trusted Web Activity (TWA)
- Minimal code changes

**Pros:**
- Fastest to implement
- Single codebase
- Easy updates

**Cons:**
- Limited native features
- Performance limitations
- Not true "native" experience

---

## Recommended Approach: Full Native with Jetpack Compose

### Project Structure

```
app/
├── src/
│   ├── main/
│   │   ├── java/com/teamtalk/transfers/
│   │   │   ├── data/
│   │   │   │   ├── local/
│   │   │   │   │   ├── database/
│   │   │   │   │   │   ├── TransferDatabase.kt
│   │   │   │   │   │   ├── dao/
│   │   │   │   │   │   └── entities/
│   │   │   │   │   └── repository/
│   │   │   │   └── remote/
│   │   │   │       ├── api/
│   │   │   │       │   ├── TeamTalkApi.kt
│   │   │   │       │   ├── NewsApi.kt
│   │   │   │       │   └── TransferApi.kt
│   │   │   │       └── dto/
│   │   │   ├── domain/
│   │   │   │   ├── model/
│   │   │   │   │   ├── Transfer.kt
│   │   │   │   │   ├── Player.kt
│   │   │   │   │   ├── Club.kt
│   │   │   │   │   └── NewsArticle.kt
│   │   │   │   └── usecase/
│   │   │   ├── ui/
│   │   │   │   ├── theme/
│   │   │   │   ├── components/
│   │   │   │   │   ├── TransferCard.kt
│   │   │   │   │   ├── ClubCard.kt
│   │   │   │   │   ├── NewsCard.kt
│   │   │   │   │   └── PlayerCard.kt
│   │   │   │   ├── screens/
│   │   │   │   │   ├── home/
│   │   │   │   │   │   └── HomeScreen.kt
│   │   │   │   │   ├── transfers/
│   │   │   │   │   │   ├── TransfersScreen.kt
│   │   │   │   │   │   └── TransferDetailScreen.kt
│   │   │   │   │   ├── clubs/
│   │   │   │   │   │   ├── ClubsScreen.kt
│   │   │   │   │   │   └── ClubDetailScreen.kt
│   │   │   │   │   ├── news/
│   │   │   │   │   │   └── NewsScreen.kt
│   │   │   │   │   └── player/
│   │   │   │   │       └── PlayerDetailScreen.kt
│   │   │   │   └── viewmodel/
│   │   │   │       ├── HomeViewModel.kt
│   │   │   │       ├── TransferViewModel.kt
│   │   │   │       └── ClubViewModel.kt
│   │   │   └── di/
│   │   │       └── AppModule.kt
│   │   └── res/
│   │       ├── layout/
│   │       ├── values/
│   │       └── drawable/
```

---

## Component Mapping

### Web Components → Android Components

| Web Component | Android Equivalent |
|--------------|-------------------|
| `React.useState` | `remember { mutableStateOf() }` (Compose) or `LiveData`/`StateFlow` |
| `React.useEffect` | `LaunchedEffect` (Compose) or `LifecycleObserver` |
| `Card` (shadcn) | `Card` composable or `CardView` |
| `Dialog` | `AlertDialog` or `Dialog` composable |
| `Select` | `DropdownMenu` or `ExposedDropdownMenuBox` |
| `Button` | `Button` composable |
| `Input` | `TextField` composable |
| `Tabs` | `TabRow` with `HorizontalPager` |
| `Chart` (Recharts) | `MPAndroidChart` or Compose Canvas |
| `Carousel` | `HorizontalPager` (Compose) or `ViewPager2` |

---

## Key Features to Implement

### 1. Data Layer

#### API Services (Kotlin with Retrofit)
```kotlin
// Example: TransferApi.kt
interface TransferApi {
    @GET("transfers")
    suspend fun getTransfers(): Response<List<TransferDto>>
    
    @GET("news")
    suspend fun getNews(): Response<List<NewsDto>>
    
    @GET("clubs/{clubId}/transfers")
    suspend fun getClubTransfers(@Path("clubId") clubId: String): Response<List<TransferDto>>
}
```

#### Local Database (Room)
```kotlin
@Entity(tableName = "transfers")
data class TransferEntity(
    @PrimaryKey val id: String,
    val playerName: String,
    val fromClub: String,
    val toClub: String,
    val fee: String,
    val date: Long,
    val status: String
)

@Dao
interface TransferDao {
    @Query("SELECT * FROM transfers ORDER BY date DESC")
    fun getAllTransfers(): Flow<List<TransferEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransfers(transfers: List<TransferEntity>)
}
```

### 2. UI Layer (Jetpack Compose)

#### Main Screen
```kotlin
@Composable
fun HomeScreen(viewModel: HomeViewModel = hiltViewModel()) {
    val transfers by viewModel.transfers.collectAsState()
    val news by viewModel.news.collectAsState()
    
    Scaffold(
        topBar = { AppTopBar() },
        bottomBar = { BottomNavigation() }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { FlashBanner() }
            item { TransferCountdown() }
            item { ClubSpendingChart(transfers) }
            item { NewsCarousel(news) }
            item { TransfersList(transfers) }
        }
    }
}
```

#### Transfer Card
```kotlin
@Composable
fun TransferCard(
    transfer: Transfer,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = transfer.playerName,
                    style = MaterialTheme.typography.titleMedium
                )
                Badge(status = transfer.status)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "${transfer.fromClub} → ${transfer.toClub}",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = transfer.fee,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}
```

### 3. Navigation

```kotlin
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") { HomeScreen() }
        composable("transfers") { TransfersScreen() }
        composable("clubs") { ClubsScreen() }
        composable("club/{clubId}") { backStackEntry ->
            ClubDetailScreen(backStackEntry.arguments?.getString("clubId"))
        }
        composable("player/{playerId}") { backStackEntry ->
            PlayerDetailScreen(backStackEntry.arguments?.getString("playerId"))
        }
    }
}
```

### 4. State Management

```kotlin
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val transferRepository: TransferRepository
) : ViewModel() {
    
    private val _transfers = MutableStateFlow<List<Transfer>>(emptyList())
    val transfers: StateFlow<List<Transfer>> = _transfers.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    init {
        viewModelScope.launch {
            transferRepository.getTransfers()
                .collect { transfers ->
                    _transfers.value = transfers
                }
        }
    }
    
    fun refreshTransfers() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                transferRepository.refreshTransfers()
            } finally {
                _isLoading.value = false
            }
        }
    }
}
```

---

## Dependencies (build.gradle.kts)

```kotlin
dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    
    // Compose
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.6")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    
    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    
    // Dependency Injection
    implementation("com.google.dagger:hilt-android:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    kapt("com.google.dagger:hilt-compiler:2.48")
    
    // Image Loading
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Charts
    implementation("com.github.PhilJay:MPAndroidChart:v3.1.0")
    
    // Date/Time
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.5.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
}
```

---

## Migration Steps

### Phase 1: Setup & Infrastructure (Week 1-2)
1. Create new Android project
2. Setup Jetpack Compose
3. Configure dependency injection (Hilt)
4. Setup networking layer (Retrofit)
5. Setup database (Room)
6. Create base architecture (MVVM)

### Phase 2: Data Models & API (Week 2-3)
1. Convert TypeScript interfaces to Kotlin data classes
2. Create API interfaces matching existing endpoints
3. Implement repository pattern
4. Setup local caching with Room
5. Implement data synchronization

### Phase 3: Core UI Components (Week 3-5)
1. Create reusable Compose components
   - Cards, Buttons, Dialogs
   - Lists, Grids
   - Charts (using MPAndroidChart or Canvas)
2. Implement theme system (dark/light mode)
3. Create navigation structure

### Phase 4: Feature Screens (Week 5-8)
1. Home Screen
   - Flash Banner
   - Transfer Countdown
   - Club Spending Chart
   - News Carousel
   - Transfers List
2. Transfers Screen
   - Filtering
   - Search
   - Confirmed/Rumored tabs
3. Clubs Screen
   - Club list
   - Club detail with transfers
   - Player comparisons
4. News Screen
   - News feed
   - Article detail
5. Player Detail Screen
   - Player stats
   - Transfer history
   - Comparison

### Phase 5: Advanced Features (Week 8-10)
1. CMS functionality (if needed in app)
2. Push notifications
3. Offline support
4. Background sync
5. Analytics integration

### Phase 6: Testing & Polish (Week 10-12)
1. Unit tests
2. UI tests
3. Performance optimization
4. Bug fixes
5. App store preparation

---

## Key Considerations

### 1. API Compatibility
- Ensure all Netlify Functions are accessible from Android
- Handle CORS if needed
- Implement proper error handling
- Add retry logic for network failures

### 2. Offline Support
- Cache transfers, news, and club data locally
- Show cached data when offline
- Sync when connection restored
- Handle conflicts gracefully

### 3. Performance
- Use `LazyColumn`/`LazyRow` for lists
- Implement pagination for large datasets
- Optimize image loading with Coil
- Use `remember` and `derivedStateOf` appropriately

### 4. User Experience
- Follow Material Design 3 guidelines
- Implement pull-to-refresh
- Add loading states
- Handle empty states
- Provide error feedback

### 5. Push Notifications
- Integrate Firebase Cloud Messaging (FCM)
- Notify on new transfers
- Notify on breaking news
- Allow user preferences

---

## Estimated Timeline

- **Small Team (1-2 developers):** 12-16 weeks
- **Medium Team (3-4 developers):** 8-10 weeks
- **Large Team (5+ developers):** 6-8 weeks

---

## Resources

### Official Documentation
- [Jetpack Compose](https://developer.android.com/jetpack/compose)
- [Android Architecture Components](https://developer.android.com/topic/architecture)
- [Room Database](https://developer.android.com/training/data-storage/room)
- [Retrofit](https://square.github.io/retrofit/)

### Learning Resources
- [Android Developers YouTube](https://www.youtube.com/@androiddevelopers)
- [Kotlin for Android](https://developer.android.com/kotlin)
- [Material Design 3](https://m3.material.io/)

---

## Next Steps

1. **Decision:** Choose migration approach (Native vs React Native)
2. **Setup:** Create Android Studio project
3. **Planning:** Break down features into sprints
4. **Development:** Start with core infrastructure, then features
5. **Testing:** Continuous testing throughout development
6. **Deployment:** Prepare for Google Play Store

---

## Questions to Consider

1. Do you need iOS support? (Consider React Native or Flutter)
2. What's the timeline?
3. What's the team size and Android expertise?
4. Do you need offline functionality?
5. What native features are required? (Push notifications, camera, etc.)
6. What's the budget?

---

## Support

For questions or assistance with the migration, consider:
- Hiring Android developers
- Using a migration service
- Gradual migration (start with MVP, add features incrementally)

