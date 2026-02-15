class ExamPaper {
  final String subject;
  final String className;
  final int totalMarks;
  final int timeMinutes;
  final List<ExamSection> sections;

  ExamPaper({
    required this.subject,
    required this.className,
    required this.totalMarks,
    required this.timeMinutes,
    required this.sections,
  });
}

class ExamSection {
  final String title;
  final int marksPerQuestion;
  final List<String> questions;

  ExamSection({
    required this.title,
    required this.marksPerQuestion,
    required this.questions,
  });
}
