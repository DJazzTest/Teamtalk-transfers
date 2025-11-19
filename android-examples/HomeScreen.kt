// Example: Converting React Website.tsx to Jetpack Compose HomeScreen
// Original: src/pages/Website.tsx

package com.teamtalk.transfers.ui.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.teamtalk.transfers.ui.components.*

@Composable
fun HomeScreen(
    viewModel: HomeViewModel = hiltViewModel(),
    onClubClick: (String) -> Unit = {},
    onPlayerClick: (String) -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("TeamTalk Transfers") }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Flash Banner
            item {
                FlashBanner(
                    bannerData = uiState.flashBanner,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            
            // Transfer Countdown
            item {
                TransferCountdown(
                    targetDate = uiState.countdownTarget,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            
            // Club Spending Chart
            item {
                ClubSpendingChart(
                    transfers = uiState.transfers,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            
            // Tabs: Confirmed, News, Live Hub, Top 10, Video
            item {
                TabRow(selectedTabIndex = uiState.selectedTab) {
                    Tab(
                        selected = uiState.selectedTab == 0,
                        onClick = { viewModel.selectTab(0) },
                        text = { Text("Confirmed") }
                    )
                    Tab(
                        selected = uiState.selectedTab == 1,
                        onClick = { viewModel.selectTab(1) },
                        text = { Text("News") }
                    )
                    Tab(
                        selected = uiState.selectedTab == 2,
                        onClick = { viewModel.selectTab(2) },
                        text = { Text("Live Hub") }
                    )
                    Tab(
                        selected = uiState.selectedTab == 3,
                        onClick = { viewModel.selectTab(3) },
                        text = { Text("Top 10") }
                    )
                    Tab(
                        selected = uiState.selectedTab == 4,
                        onClick = { viewModel.selectTab(4) },
                        text = { Text("Video") }
                    )
                }
            }
            
            // Tab Content
            when (uiState.selectedTab) {
                0 -> {
                    // Confirmed Transfers
                    items(uiState.confirmedTransfers) { transfer ->
                        TransferCard(
                            transfer = transfer,
                            onClick = { onPlayerClick(transfer.playerId) }
                        )
                    }
                }
                1 -> {
                    // News Carousel
                    item {
                        NewsCarousel(
                            articles = uiState.newsArticles,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
                2 -> {
                    // Live Hub
                    items(uiState.liveHubEntries) { entry ->
                        LiveHubCard(
                            entry = entry,
                            onClick = { /* Handle click */ }
                        )
                    }
                }
                3 -> {
                    // Top 10
                    items(uiState.top10Transfers) { transfer ->
                        Top10TransferCard(
                            transfer = transfer,
                            rank = uiState.top10Transfers.indexOf(transfer) + 1,
                            onClick = { onPlayerClick(transfer.playerId) }
                        )
                    }
                }
                4 -> {
                    // Video Tab
                    items(uiState.videos) { video ->
                        VideoCard(
                            video = video,
                            onClick = { /* Handle click */ }
                        )
                    }
                }
            }
            
            // Summer Ins/Outs
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Summer Ins
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Summer Ins 2025/26",
                            style = MaterialTheme.typography.titleMedium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        ClubTransfersList(
                            transfers = uiState.summerIns,
                            onTransferClick = { transfer ->
                                onClubClick(transfer.toClub)
                            }
                        )
                    }
                    
                    // Summer Outs
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Summer Outs 2025/26",
                            style = MaterialTheme.typography.titleMedium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        ClubTransfersList(
                            transfers = uiState.summerOuts,
                            onTransferClick = { transfer ->
                                onClubClick(transfer.fromClub)
                            }
                        )
                    }
                }
            }
        }
    }
    
    // Loading indicator
    if (uiState.isLoading) {
        CircularProgressIndicator(
            modifier = Modifier
                .fillMaxSize()
                .wrapContentSize(Alignment.Center)
        )
    }
}

