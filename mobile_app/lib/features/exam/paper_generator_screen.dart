import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/exam_paper.dart';
import '../../services/whatsapp_service.dart';

class PaperGeneratorScreen extends ConsumerStatefulWidget {
  const PaperGeneratorScreen({super.key});

  @override
  ConsumerState<PaperGeneratorScreen> createState() => _PaperGeneratorScreenState();
}

class _PaperGeneratorScreenState extends ConsumerState<PaperGeneratorScreen> {
  int _currentStep = 0;
  bool _isGenerating = false;
  bool _isScanning = false; // New: AI scanning state
  ExamPaper? _generatedPaper;
  
  // Data for generation
  String _subject = "Science";
  String _className = "10th";
  List<String> _chapters = [];
  List<String> _selectedChapters = [];
  String _difficulty = 'Medium';
  String _examType = 'Unit Test';
  int _totalMarks = 30;

  // ... (keeping _sections as is) ...

  void _startScanning() async {
    setState(() {
      _isScanning = true;
      _chapters = [];
      _selectedChapters = [];
    });
    
    // Simulate AI Text Extraction & Chapter Detection
    await Future.delayed(const Duration(seconds: 2));
    
    setState(() {
      _isScanning = false;
      _chapters = ["Motion", "Force", "Gravitation", "Work & Energy", "Sound", "Atoms & Molecules"];
      _selectedChapters = ["Motion", "Force"];
      _currentStep = 1; // Auto move to selection
    });
  }

  // ... (inside build) ...

  Step _buildUploadStep() {
    return Step(
      title: const Text('Upload'),
      isActive: _currentStep >= 0,
      content: Column(
        children: [
          if (_isScanning) ...[
            const SizedBox(height: 20),
            const CircularProgressIndicator(strokeWidth: 2),
            const SizedBox(height: 16),
            const Text("AI is reading Textbook PDF...", style: TextStyle(fontWeight: FontWeight.bold)),
            const Text("Extracting chapters & topics...", style: TextStyle(color: Colors.grey, fontSize: 11)),
            const SizedBox(height: 20),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(32),
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  Icon(Icons.picture_as_pdf_outlined, size: 48, color: Colors.red.shade400),
                  const SizedBox(height: 16),
                  const Text("Upload Study Material", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const Text("PDF or Photos of book pages", style: TextStyle(color: Colors.grey, fontSize: 12)),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _startScanning,
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo.shade50, foregroundColor: Colors.indigo),
                    child: const Text("Select & Scan PDF"),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 20),
          if (_chapters.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.green, size: 18),
                  const SizedBox(width: 8),
                  Text("AI Detected ${_chapters.length} Chapters", style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Step _buildChapterStep() {
    return Step(
      title: const Text('Selection'),
      isActive: _currentStep >= 1,
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Select Lessons for Exam:", style: TextStyle(fontWeight: FontWeight.bold)),
              TextButton(
                onPressed: () => setState(() {
                  if (_selectedChapters.length == _chapters.length) _selectedChapters.clear();
                  else _selectedChapters = List.from(_chapters);
                }),
                child: Text(_selectedChapters.length == _chapters.length ? "Deselect All" : "Select All"),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            maxHeight: 300,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _chapters.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final ch = _chapters[index];
                final isSelected = _selectedChapters.contains(ch);
                return CheckboxListTile(
                  title: Text(ch, style: TextStyle(
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? Colors.indigo : Colors.black87,
                  )),
                  value: isSelected,
                  activeColor: Colors.indigo,
                  onChanged: (val) {
                    setState(() {
                      if (val!) _selectedChapters.add(ch);
                      else _selectedChapters.remove(ch);
                    });
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          const Text("Difficulty Level:", style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Row(
            children: ['Easy', 'Medium', 'Hard'].map((d) => Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: ChoiceChip(
                  label: Center(child: Text(d)),
                  selected: _difficulty == d,
                  onSelected: (val) => setState(() => _difficulty = d),
                ),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }

  Step _buildPatternStep() {
    return Step(
      title: const Text('Type'),
      isActive: _currentStep >= 2,
      content: Column(
        children: [
          _PatternTile(
            title: "Unit Test",
            marks: 30,
            icon: Icons.description,
            isSelected: _examType == "Unit Test",
            onTap: () => setState(() { _examType = "Unit Test"; _totalMarks = 30; }),
          ),
          _PatternTile(
            title: "Class Test",
            marks: 20,
            icon: Icons.assignment,
            isSelected: _examType == "Class Test",
            onTap: () => setState(() { _examType = "Class Test"; _totalMarks = 20; }),
          ),
          _PatternTile(
            title: "Final Exam",
            marks: 80,
            icon: Icons.school,
            isSelected: _examType == "Final Exam",
            onTap: () => setState(() { _examType = "Final Exam"; _totalMarks = 80; }),
          ),
        ],
      ),
    );
  }

  Step _buildStructureStep() {
    int currentSum = _sections.fold(0, (sum, sec) => sum + (sec['count'] as int) * (sec['marks'] as int));
    bool isValid = currentSum == _totalMarks;

    return Step(
      title: const Text('Marks'),
      isActive: _currentStep >= 3,
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isValid ? Colors.green.shade50 : Colors.red.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(isValid ? Icons.check_circle : Icons.error, color: isValid ? Colors.green : Colors.red, size: 20),
                const SizedBox(width: 12),
                Text("Total: $currentSum / $_totalMarks Marks", style: TextStyle(fontWeight: FontWeight.bold, color: isValid ? Colors.green.shade900 : Colors.red.shade900)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ..._sections.map((sec) => Card(
            elevation: 0,
            margin: const EdgeInsets.only(bottom: 8),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.grey.shade200)),
            child: ListTile(
              title: Text(sec['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: Text("${sec['count']} 📝 x ${sec['marks']} ⭐ per question"),
              trailing: const Icon(Icons.edit, size: 18),
            ),
          )),
        ],
      ),
    );
  }

  Step _buildPreviewStep() {
    return Step(
      title: const Text('Review'),
      isActive: _currentStep >= 4,
      content: Column(
        children: [
          const Icon(Icons.auto_awesome, size: 64, color: Colors.orange),
          const SizedBox(height: 16),
          const Text("Ready to Generate", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 8),
          Text("AI will create a $_difficulty difficulty paper for $_className $_subject based on ${_selectedChapters.join(', ')} chapters.", 
            textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildResultView() {
    final paper = _generatedPaper!;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Generated Exam Paper"),
        actions: [
          IconButton(icon: const Icon(Icons.share), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(border: Border.all(color: Colors.black, width: 2)),
              child: Column(
                children: [
                  const Text("MONRY MITRA ACADEMY", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
                  const SizedBox(height: 8),
                  Text("Class: ${paper.className} | Subject: ${paper.subject}", style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text("Time: ${paper.timeMinutes} Minutes | Marks: ${paper.totalMarks}", style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Content
            ...paper.sections.map((sec) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                Center(child: Text(sec.title, style: const TextStyle(fontWeight: FontWeight.bold, decoration: TextDecoration.underline))),
                const SizedBox(height: 12),
                ...sec.questions.asMap().entries.map((e) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("${e.key + 1}. "),
                      Expanded(child: Text(e.value)),
                      Text("(${sec.marksPerQuestion})"),
                    ],
                  ),
                )),
              ],
            )),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)]),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.download),
                label: const Text("Export PDF"),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.send),
                label: const Text("WhatsApp"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _generatePaper() async {
    setState(() => _isGenerating = true);
    // Simulate AI Generation
    await Future.delayed(const Duration(seconds: 3));
    
    setState(() {
      _isGenerating = false;
      _generatedPaper = ExamPaper(
        subject: _subject,
        className: _className,
        totalMarks: _totalMarks,
        timeMinutes: 60,
        sections: [
          ExamSection(
            title: "SECTION A - MCQ",
            marksPerQuestion: 1,
            questions: [
              "What is the SI unit of velocity?",
              "Define inertia of motion.",
              "If displacement is zero, then average velocity is...",
              "Value of 'g' at center of earth is...",
              "Newton's 1st law is also called...",
            ],
          ),
          ExamSection(
            title: "SECTION B - Short Answer",
            marksPerQuestion: 3,
            questions: [
              "Differentiate between distance and displacement.",
              "Explain the concept of momentum with example.",
              "State and derive Newton's second law of motion.",
              "What happens when a person jumps out of a moving bus?",
            ],
          ),
          ExamSection(
            title: "SECTION C - Long Answer",
            marksPerQuestion: 13,
            questions: [
              "Derive the equations of motion using graphical method. Also define each term clearly.",
            ],
          ),
        ],
      );
    });
  }
}

class _InfoField extends StatelessWidget {
  final String label, value;
  const _InfoField({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _PatternTile extends StatelessWidget {
  final String title;
  final int marks;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _PatternTile({required this.title, required this.marks, required this.icon, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isSelected ? Colors.indigo : Colors.grey.shade200, width: isSelected ? 2 : 1),
      ),
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: isSelected ? Colors.indigo : Colors.grey),
        title: Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? Colors.indigo : Colors.black87)),
        subtitle: Text("Standard template for $marks Marks"),
        trailing: isSelected ? const Icon(Icons.check_circle, color: Colors.indigo) : null,
      ),
    );
  }
}
