// Example: Converting React TransferCard to Jetpack Compose
// Original: src/components/TransferCard.tsx

package com.teamtalk.transfers.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.teamtalk.transfers.domain.model.Transfer

@Composable
fun TransferCard(
    transfer: Transfer,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Header: Player name and status badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = transfer.playerName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                
                // Status badge
                Badge(
                    containerColor = when (transfer.status) {
                        "confirmed" -> MaterialTheme.colorScheme.primary
                        "rumored" -> MaterialTheme.colorScheme.secondary
                        else -> MaterialTheme.colorScheme.surfaceVariant
                    }
                ) {
                    Text(
                        text = transfer.status.uppercase(),
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
            
            // Transfer details: From → To
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = transfer.fromClub,
                    style = MaterialTheme.typography.bodyMedium
                )
                Text("→", style = MaterialTheme.typography.bodyMedium)
                Text(
                    text = transfer.toClub,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
            }
            
            // Fee
            Text(
                text = transfer.fee,
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.SemiBold
            )
            
            // Date
            Text(
                text = formatDate(transfer.date),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

private fun formatDate(timestamp: Long): String {
    // Use kotlinx-datetime or SimpleDateFormat
    return "2 hours ago" // Placeholder
}

