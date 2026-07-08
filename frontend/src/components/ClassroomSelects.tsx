import type { ClassroomFilter } from '@/types';
import { SUBJECTS } from '@/types';
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
    <div className="grid gap-4 sm:grid-cols-1 max-w-xs">
      <div className="space-y-2">
        <Label>Fach</Label>
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
    </div>
  );
}
