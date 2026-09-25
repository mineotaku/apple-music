import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/song.dart';
import '../services/api_service.dart';
import '../services/player_service.dart';
import '../theme/apple_theme.dart';
import '../widgets/song_tile.dart';

class SearchView extends StatefulWidget {
  const SearchView({super.key});

  @override
  State<SearchView> createState() => _SearchViewState();
}

class _SearchViewState extends State<SearchView> {
  final TextEditingController _searchCtrl = TextEditingController();
  List<Song> _searchResults = [];
  bool _isSearching = false;

  void _onSearch(String q) async {
    if (q.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
      return;
    }
    setState(() => _isSearching = true);
    final results = await ApiService.searchSongs(q);
    if (mounted) {
      setState(() {
        _searchResults = results;
        _isSearching = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          floating: true,
          expandedHeight: 60,
          backgroundColor: AppleTheme.background,
          title: const Text(
            'Search',
            style: TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.6,
            ),
          ),
        ),

        // iOS Search Box
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Container(
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E22),
                borderRadius: BorderRadius.circular(10),
              ),
              child: TextField(
                controller: _searchCtrl,
                onChanged: _onSearch,
                style: const TextStyle(color: Colors.white, fontSize: 15),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search_rounded, color: AppleTheme.textSecondary, size: 20),
                  suffixIcon: _searchCtrl.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear_rounded, color: AppleTheme.textSecondary, size: 18),
                          onPressed: () {
                            _searchCtrl.clear();
                            _onSearch('');
                          },
                        )
                      : null,
                  hintText: 'Artists, Songs, Lyrics, and More',
                  hintStyle: const TextStyle(color: AppleTheme.textSecondary, fontSize: 14),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                ),
              ),
            ),
          ),
        ),

        // Search Results or Suggested Trending Searches
        if (_searchCtrl.text.trim().isNotEmpty) ...[
          if (_isSearching)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(40.0),
                child: Center(child: CircularProgressIndicator(color: AppleTheme.primary)),
              ),
            )
          else if (_searchResults.isEmpty)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(40.0),
                child: Center(
                  child: Text('No matching songs found', style: TextStyle(color: AppleTheme.textSecondary)),
                ),
              ),
            )
          else ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Text(
                  'Top Results (${_searchResults.length})',
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (ctx, i) => SongTile(song: _searchResults[i], queue: _searchResults),
                childCount: _searchResults.length,
              ),
            ),
          ],
        ] else ...[
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16, 20, 16, 12),
              child: Text(
                'Explore Top Genres',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  'Spatial Audio',
                  'Lossless ALAC',
                  'Electronic',
                  'Indie Pop',
                  'Nocturnal Lofi',
                  'Dolby Atmos',
                ].map((tag) {
                  return ActionChip(
                    label: Text(tag, style: const TextStyle(color: Colors.white, fontSize: 13)),
                    backgroundColor: const Color(0xFF242428),
                    side: BorderSide.none,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    onPressed: () {
                      _searchCtrl.text = tag;
                      _onSearch(tag);
                    },
                  );
                }).toList(),
              ),
            ),
          ),
        ],

        const SliverToBoxAdapter(child: SizedBox(height: 100)),
      ],
    );
  }
}
