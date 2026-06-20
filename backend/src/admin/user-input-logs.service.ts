import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import {
  UserInputLog,
  USER_INPUT_LOG_SOURCES,
  USER_INPUT_LOG_STATUSES,
} from './schemas/user-input-log.schema';

type CreateUserInputLogInput = {
  userId: Types.ObjectId;
  familyId?: Types.ObjectId;
  source: (typeof USER_INPUT_LOG_SOURCES)[number];
  value?: string;
  categoryId?: Types.ObjectId;
  unit?: string;
  relatedId?: Types.ObjectId;
};

@Injectable()
export class UserInputLogsService {
  constructor(
    @InjectModel(UserInputLog.name)
    private readonly userInputLogModel: Model<UserInputLog>,
  ) {}

  async createIfManual(input: CreateUserInputLogInput) {
    const value = input.value?.trim();
    if (!value) {
      return null;
    }

    return this.userInputLogModel.create({
      ...input,
      value,
      status: 'pending',
    });
  }

  async findAll(query: {
    status?: (typeof USER_INPUT_LOG_STATUSES)[number];
    source?: (typeof USER_INPUT_LOG_SOURCES)[number];
    page?: number;
    limit?: number;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const filter: Record<string, unknown> = {};

    if (query.status) filter.status = query.status;
    if (query.source) filter.source = query.source;

    const [items, total] = await Promise.all([
      this.userInputLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.userInputLogModel.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateStatus(
    user: AuthenticatedUser,
    logId: string,
    input: {
      status: Extract<
        (typeof USER_INPUT_LOG_STATUSES)[number],
        'approved' | 'rejected'
      >;
      note?: string;
    },
  ) {
    const log = await this.userInputLogModel.findById(logId).exec();
    if (!log) {
      throw new NotFoundException('User input log not found');
    }

    log.status = input.status;
    log.note = input.note;
    log.reviewedBy = new Types.ObjectId(user.userId);
    log.reviewedAt = new Date();
    await log.save();

    return this.toResponse(log);
  }

  private toResponse(log: UserInputLog) {
    return {
      id: log._id.toString(),
      userId: log.userId.toString(),
      familyId: log.familyId?.toString(),
      source: log.source,
      value: log.value,
      categoryId: log.categoryId?.toString(),
      unit: log.unit,
      relatedId: log.relatedId?.toString(),
      status: log.status,
      reviewedBy: log.reviewedBy?.toString(),
      reviewedAt: log.reviewedAt,
      note: log.note,
      createdAt: (log as UserInputLog & { createdAt?: Date }).createdAt,
    };
  }
}
