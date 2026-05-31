import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sponsors')
export class Sponsor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    discord?: string;
  };

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  packages: Array<{
    name: string;
    price: number;
    benefits: string[];
  }>;

  @Column({ type: 'json', nullable: true })
  sponsoredTournaments: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
