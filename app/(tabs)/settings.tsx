import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Volume2, Type, Globe, CircleHelp as HelpCircle, Info, ChevronRight, Moon, Palette } from 'lucide-react-native';
import { useUserSettings } from '@/hooks/useSupabaseData';

export default function SettingsScreen() {
  const { settings, updateSettings, loading } = useUserSettings();
  
  if (loading || !settings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载设置中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fontSizes = ['standard', 'large', 'extra_large'];
  const fontSizeLabels = { standard: '标准', large: '大', extra_large: '超大' };
  const languages = ['chinese', 'english'];
  const languageLabels = { chinese: '中文', english: 'English' };
  const themes = ['light', 'dark', 'auto'];
  const themeLabels = { light: '浅色', dark: '深色', auto: '跟随系统' };

  const settingSections = [
    {
      title: '显示设置',
      items: [
        {
          title: '字体大小',
          subtitle: '调整应用内文字大小',
          icon: Type,
          value: settings.font_size,
          type: 'select',
          options: fontSizes,
          optionLabels: fontSizeLabels,
          onChange: (value: string) => updateSettings({ font_size: value }),
        },
        {
          title: '语言设置',
          subtitle: '选择题库语言',
          icon: Globe,
          value: settings.language,
          type: 'select',
          options: languages,
          optionLabels: languageLabels,
          onChange: (value: string) => updateSettings({ language: value }),
        },
        {
          title: '主题设置',
          subtitle: '选择应用主题外观',
          icon: Palette,
          value: settings.theme,
          type: 'select',
          options: themes,
          optionLabels: themeLabels,
          onChange: (value: string) => updateSettings({ theme: value }),
        },
      ],
    },
    {
      title: '辅助功能',
      items: [
        {
          title: '语音播报',
          subtitle: '开启题目和选项的语音朗读',
          icon: Volume2,
          value: settings.voice_enabled,
          type: 'switch',
          onChange: (value: boolean) => updateSettings({ voice_enabled: value }),
        },
      ],
    },
    {
      title: '帮助支持',
      items: [
        {
          title: '使用帮助',
          subtitle: '查看应用使用说明',
          icon: HelpCircle,
          type: 'navigation',
          onPress: () => {},
        },
        {
          title: '关于我们',
          subtitle: '版本信息和开发团队',
          icon: Info,
          type: 'navigation',
          onPress: () => {},
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number, sectionItems: any[]) => {
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.settingItemTouchable,
          index < sectionItems.length - 1 && styles.settingItemBorder
        ]}
        onPress={() => {
          if (item.type === 'select') {
            // Handle select option cycling
            const currentIndex = item.options.indexOf(item.value);
            const nextIndex = (currentIndex + 1) % item.options.length;
            item.onChange(item.options[nextIndex]);
          } else if (item.onPress) {
            item.onPress();
          }
        }}
        disabled={item.type === 'switch'}
        activeOpacity={item.type === 'switch' ? 1 : 0.8}
      >
        <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <item.icon size={24} color="#1E40AF" strokeWidth={2} />
        </View>
        
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>

        <View style={styles.settingControl}>
          {item.type === 'switch' && (
            <Switch
              value={item.value}
              onValueChange={item.onChange}
              trackColor={{ false: '#E2E8F0', true: '#93C5FD' }}
              thumbColor={item.value ? '#1E40AF' : '#F1F5F9'}
              style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
            />
          )}
          
          {item.type === 'select' && (
            <View style={styles.selectContainer}>
              <Text style={styles.selectValue}>
                {item.optionLabels ? item.optionLabels[item.value] : item.value}
              </Text>
              <ChevronRight size={20} color="#64748B" strokeWidth={2} />
            </View>
          )}
          
          {item.type === 'navigation' && (
            <ChevronRight size={24} color="#64748B" strokeWidth={2} />
          )}
        </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>设置</Text>
          <Text style={styles.subtitle}>个性化您的学习体验</Text>
        </View>

        {/* Font Size Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>字体大小预览</Text>
          <View style={styles.fontPreview}>
            <Text style={[
              styles.previewText,
              settings.font_size === 'standard' && { fontSize: 16 },
              settings.font_size === 'large' && { fontSize: 20 },
              settings.font_size === 'extra_large' && { fontSize: 24 },
            ]}>
              将转向灯开关向下拉，右转向灯会亮起。
            </Text>
          </View>
          <View style={styles.fontSizeButtons}>
            {fontSizes.map((size, index) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.fontSizeButton,
                  settings.font_size === size && styles.fontSizeButtonActive
                ]}
                onPress={() => updateSettings({ font_size: size })}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.fontSizeButtonText,
                  settings.font_size === size && styles.fontSizeButtonTextActive
                ]}>
                  {fontSizeLabels[size as keyof typeof fontSizeLabels]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.settingSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                renderSettingItem(item, itemIndex, section.items)
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>版本 1.0.1</Text>
          <Text style={styles.appCopyright}>© 2025 三力测试通团队</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  fontPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  previewText: {
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 28,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  fontSizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fontSizeButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1E40AF',
  },
  fontSizeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  fontSizeButtonTextActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  settingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginHorizontal: 24,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItemTouchable: {
    minHeight: 72,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  settingControl: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E40AF',
    marginRight: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});