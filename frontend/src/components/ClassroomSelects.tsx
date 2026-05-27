import type { ClassroomFilter } from '@/types';
import { GRADES, SECTIONS, SUBJECTS } from '@/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClassroomSelectsProps {
  values: ClassroomFilter;
  onChange: (values: ClassroomFilter) => void;
  subjectsList?: readonly string[] | string[];
}

export default function ClassroomSelects({ values, onChange, subjectsList }: ClassroomSelectsProps) {
  const activeSubjects = subjectsList || SUBJECTS;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label>Subject</Label>
        <Select
          value={values.subject}
          onValueChange={(subject) => onChange({ ...values, subject })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {activeSubjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Class</Label>
        <Select value={values.grade} onValueChange={(grade) => onChange({ ...values, grade })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRADES.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Section</Label>
        <Select
          value={values.section}
          onValueChange={(section) => onChange({ ...values, section })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SECTIONS.map((section) => (
              <SelectItem key={section} value={section}>
                {section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
